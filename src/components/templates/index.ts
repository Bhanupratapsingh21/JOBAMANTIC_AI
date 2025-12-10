
// Template mapping for easy access
import { JakeTemplate } from './JakeTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { TemplateName } from '@/types/resume';

export { JakeTemplate } from './JakeTemplate';
export { ModernTemplate } from './ModernTemplate';
export { ClassicTemplate } from './ClassicTemplate';
export { ExecutiveTemplate } from './ExecutiveTemplate';
export { MinimalTemplate } from './MinimalTemplate';
export { AcademicTemplate } from './AcademicTemplate';


export const templates = {
    jake: JakeTemplate,
    modern: ModernTemplate,
    classic: ClassicTemplate,
    executive: ExecutiveTemplate,
    minimal: MinimalTemplate,
    academic: AcademicTemplate,
} as const;

export const getTemplateComponent = (template: TemplateName) => {
    return templates[template] || JakeTemplate;
};