import { TemplateProps } from '@/types/resume';

export const MinimalTemplate = ({ data }: TemplateProps) => {
  return (
    <div
      className="
        mx-auto bg-white text-gray-800 font-sans
         min-h-[287mm] p-[12mm]
        leading-relaxed box-border
        print: print:h-[287mm]
      "
    >
      {/* Header */}
      <header className="mb-10 border-b border-gray-300 pb-4">
        <h1 className="text-4xl font-light tracking-wide mb-1 text-gray-900">
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.headline && (
          <p className="text-lg text-gray-600 mb-3">{data.personalInfo.headline}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && (
            <>
              <span>•</span>
              <span>{data.personalInfo.phone}</span>
            </>
          )}
          {data.personalInfo.location && (
            <>
              <span>•</span>
              <span>{data.personalInfo.location}</span>
            </>
          )}
        </div>
      </header>

      {/* Experience */}
      <section className="mb-10">
        <h2 className="text-xl font-medium text-gray-900 border-b border-gray-300 pb-1 mb-5">
          Experience
        </h2>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {exp.startDate} – {exp.endDate}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {exp.company}
              {exp.location && `, ${exp.location}`}
            </p>
            <ul className="list-none text-sm space-y-1 text-gray-700">
              {exp.description.map((desc, descIndex) => (
                <li key={descIndex} className="pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-500">
                  {desc}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <h2 className="text-xl font-medium text-gray-900 border-b border-gray-300 pb-1 mb-5">
          Education
        </h2>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
              <span className="text-sm text-gray-600">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <p className="text-sm italic text-gray-700">{edu.degree}</p>
            {edu.location && <p className="text-sm text-gray-600">{edu.location}</p>}
            {edu.gpa && (
              <p className="text-sm text-gray-700">
                <strong>GPA:</strong> {edu.gpa}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Optional Skills Section (if present) */}
      {Object.keys(data.skills || {}).some(key => (data.skills as any)[key]?.length > 0) && (
        <section className="mt-10">
          <h2 className="text-xl font-medium text-gray-900 border-b border-gray-300 pb-1 mb-5">
            Skills
          </h2>
          <div className="text-sm text-gray-700 space-y-2">
            {data.skills.languages?.length > 0 && (
              <p>
                <strong>Languages:</strong> {data.skills.languages.join(', ')}
              </p>
            )}
            {data.skills.frameworks?.length > 0 && (
              <p>
                <strong>Frameworks:</strong> {data.skills.frameworks.join(', ')}
              </p>
            )}
            {data.skills.tools?.length > 0 && (
              <p>
                <strong>Tools:</strong> {data.skills.tools.join(', ')}
              </p>
            )}
            {data.skills.libraries?.length > 0 && (
              <p>
                <strong>Libraries:</strong> {data.skills.libraries.join(', ')}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
