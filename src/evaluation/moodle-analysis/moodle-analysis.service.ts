// services/moodle-analysis.service.ts
import { Injectable } from '@nestjs/common';
import { MoodleService } from '../../moodle/moodle.service';
import { CycleService } from '../../cycle/cycle.service';
import { ResourceService } from '../../resource/resource.service';

@Injectable()
export class MoodleAnalysisService {
    constructor(
        private readonly moodleService: MoodleService,
        private readonly cycleService: CycleService,
        private readonly resourceService: ResourceService,
    ) { }

    async analyzeClassroomContents(
        moodleCourseId: number,
        token: string,
        cycleId: number
    ) {
        const [courseContents, cycle, resources] = await Promise.all([
            this.moodleService.getCourseContents(moodleCourseId, token),
            this.cycleService.findOne(cycleId),
            this.resourceService.findAllByCycle(cycleId)
        ]);

        const isCycle2 = cycle?.name.toLowerCase().includes('ciclo 2');
        const matchStrategy = isCycle2
            ? this.matchCycle2Resources.bind(this)
            : this.matchDefaultResources.bind(this);

        return await matchStrategy(courseContents, resources, moodleCourseId, token);
    }

    private async matchCycle2Resources(
        courseContents: any[],
        resources: any[],
        moodleCourseId: number,
        token: string
    ) {
        const validSections = this.getValidSections(courseContents);

        const matchedResources = await Promise.all(
            resources.map(async (resource) => {
                if (resource.name.includes('Retos')) {
                    const courseAssignments = await this.moodleService.getAssignmentsByCourse(moodleCourseId, token);
                    return this.matchAssignments(resource, courseAssignments);
                }

                if (resource.name.includes('Foro de debate')) {
                    const courseForums = await this.moodleService.getForumsByCourse(moodleCourseId, token);
                    return this.matchForums(resource, courseForums);
                }

                return this.matchSections(resource, validSections);
            })
        );

        return { matchedResources, unmatchedResources: [] };
    }

    private getValidSections(courseContents: any[]): any[] {
        return courseContents.filter(section =>
            section.name &&
            section.name.trim() !== '' &&
            !['inicio', 'cierre'].includes(section.name.toLowerCase())
        );
    }

    private matchAssignments(resource: any, courseAssignments: any) {
        const validAssignments = courseAssignments.courses[0].assignments.filter((assign: any) =>
            assign.name &&
            assign.name.toLowerCase().includes('reto') &&
            assign.name.toLowerCase() !== 'reto'
        );

        return {
            resource,
            matchedSection: null,
            matchedModule: validAssignments
        };
    }

    private matchForums(resource: any, courseForums: any) {
        const validForums = courseForums.filter((forum: any) =>
            forum.type && forum.type.toLowerCase() !== 'news'
        );

        return {
            resource,
            matchedSection: null,
            matchedModule: validForums
        };
    }

    private matchSections(resource: any, validSections: any[]) {
        return {
            resource,
            matchedSection: validSections,
            matchedModule: null
        };
    }

    private async matchDefaultResources(courseContents: any[], resources: any[]) {
        const matches = { matched: [], unmatched: [] };

        for (const resource of resources) {
            const match = await this.findResourceMatch(resource, courseContents);
            if (match) {
                const flattenedMatches = match.flat();
                matches.matched.push(...flattenedMatches);
                //matches.matched.push(match);
            } else {
                matches.unmatched.push({ resource, matchedSection: null, matchedModule: null });
            }
        }

        return {
            matchedResources: matches.matched,
            unmatchedResources: matches.unmatched
        };
    }

    private async findResourceMatch(resource: any, courseContents: any[]) {
        const matches = [];

        for (const section of courseContents) {
            if (this.namesMatch(section.name, resource.name)) {
                matches.push({
                    resource,
                    matchedSection: section,
                    matchedModule: null
                });
            }

            const moduleMatch = section.modules?.find(module =>
                this.namesMatch(module.name, resource.name)
            );

            if (resource.name.toLowerCase().includes('carpeta pedagógica')) {
                const contents = await this.resourceService.findContents(resource.id);
                const contentMatches = this.matchPedagogicalFolder(moduleMatch, contents);

                for (const content of contentMatches) {
                    matches.push({
                        resource: content.resource,
                        matchedSection: content.matchedSection,
                        matchedModule: content.matchedModule
                    })
                }
            }

            if (moduleMatch) {
                matches.push({
                    resource,
                    matchedSection: section.name,
                    matchedModule: moduleMatch
                });
            }
        }
        return matches.length > 0 ? matches : null;
    }

    private namesMatch(name1?: string, name2?: string): boolean {
        return name1?.toLowerCase() === name2?.toLowerCase();
    }

    private matchPedagogicalFolder(moduleMatch: any, contents: any[]): any[] {
        if (!moduleMatch || !moduleMatch.contents || !contents) return [];

        return contents.map(content => {
            const fileIndexContents = moduleMatch.contents?.filter(item => item.filename.includes('index'));

            const matchedModule = fileIndexContents?.find((item: any) => {
                const normalizedContent = this.normalizeString(item.content);
                const normalizedName = this.normalizeString(content.name);

                // Split into words
                const contentWords = normalizedContent.split(/\s+/);
                const nameWords = normalizedName.split(/\s+/);

                // Count matching words
                const matchingWords = nameWords.filter(word =>
                    contentWords.includes(word)
                );
                const matchPercentage = (matchingWords.length / nameWords.length) * 100;

                // Consider it a match if more than 50% of words match
                return matchPercentage > 50;
            });

            return {
                resource: content,
                matchedSection: moduleMatch,
                matchedModule: matchedModule || null
            };
        });
    }

    // Utility method to normalize strings
    private normalizeString(str: string): string {
        if (!str) return '';

        return str
            .toLowerCase()
            .normalize('NFD')  // Separate accented characters
            .replace(/[\u0300-\u036f]/g, '')  // Remove accent marks
            .trim();
    }
}