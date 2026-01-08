import { TemplateProps } from '@/types/resume';
import { Section } from './shared/Section';

export const ModernTemplate = ({ data }: TemplateProps) => {
  return (
    <div
      className="
        mx-auto bg-white text-gray-800 font-sans
        min-h-[297mm]   /* A4 size */
        p-[12mm]                  /* Margins for PDF */
        box-border
        flex flex-col
        leading-relaxed
        print:h-[297mm]
      "
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start border-b-2 border-gray-200 pb-4 mb-6">
        <div className="flex-1 min-w-[60%]">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {data.personalInfo.fullName}
          </h1>
          {data.personalInfo.headline && (
            <p className="text-lg text-gray-600 mt-1">{data.personalInfo.headline}</p>
          )}
        </div>
        <div className="text-right text-sm text-gray-700 mt-3 sm:mt-0">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          {data.personalInfo.linkedin && <p>LinkedIn: {data.personalInfo.linkedin}</p>}
          {data.personalInfo.github && <p>GitHub: {data.personalInfo.github}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left / Main Content */}
        <div className="col-span-2 space-y-6">
          <Section title="Experience" modern>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {exp.position} <span className="text-gray-600">| {exp.company}</span>
                  </h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-sm text-gray-600 mb-2">{exp.location}</p>
                )}
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {exp.description.map((desc, descIndex) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section title="Projects" modern>
            {data.projects?.map((proj, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-base">{proj.name}</h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {proj.startDate} – {proj.endDate}
                  </span>
                </div>
                {proj.technologies && (
                  <p className="text-sm text-gray-600 mb-2">Tech: {proj.technologies}</p>
                )}
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {proj.description.map((desc, descIndex) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Section title="Education" modern>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {edu.institution}
                </h3>
                <p className="text-sm text-gray-700">{edu.degree}</p>
                <p className="text-xs text-gray-600">
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
            ))}
          </Section>

          <Section title="Skills" modern>
            <div className="space-y-3 text-sm">
              {data.skills.languages?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Languages</h4>
                  <p className="text-gray-700">{data.skills.languages.join(', ')}</p>
                </div>
              )}
              {data.skills.frameworks?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Frameworks</h4>
                  <p className="text-gray-700">{data.skills.frameworks.join(', ')}</p>
                </div>
              )}
              {data.skills.libraries?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Libraries</h4>
                  <p className="text-gray-700">{data.skills.libraries.join(', ')}</p>
                </div>
              )}
              {data.skills.tools?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900">Developer Tools</h4>
                  <p className="text-gray-700">{data.skills.tools.join(', ')}</p>
                </div>
              )}
            </div>
          </Section>

        
        </div>
      </div>
    </div>
  );
};
