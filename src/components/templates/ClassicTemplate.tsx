import { TemplateProps } from '@/types/resume';
import { Section } from './shared/Section';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

export const ClassicTemplate = ({ data }: TemplateProps) => {
  return (
    <div
      className="
        mx-auto bg-[#fffdf9] text-gray-800 font-serif
        min-h-[287mm] p-[12mm]
        box-border leading-relaxed
        print:h-[287mm]
      "
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-700 pb-4 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-wide mb-1">
          {data.personalInfo.fullName}
        </h1>
        {data.personalInfo.headline && (
          <p className="text-lg italic text-gray-700">{data.personalInfo.headline}</p>
        )}

        <div className="flex flex-wrap justify-center items-center gap-4 mt-3 text-sm text-gray-700">
          {data.personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-600" /> {data.personalInfo.email}
            </span>
          )}
          {data.personalInfo.phone && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-600" /> {data.personalInfo.phone}
              </span>
            </>
          )}
          {data.personalInfo.location && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-600" /> {data.personalInfo.location}
              </span>
            </>
          )}
        </div>

        {(data.personalInfo.linkedin || data.personalInfo.github) && (
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 mt-2">
            {data.personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-gray-500" /> {data.personalInfo.linkedin}
              </span>
            )}
            {data.personalInfo.github && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Github className="w-3.5 h-3.5 text-gray-500" /> {data.personalInfo.github}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Experience */}
        <Section title="PROFESSIONAL EXPERIENCE" classic>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={index} className="pb-2 border-b border-gray-100 last:border-none">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                  <span className="text-sm text-gray-600">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <p className="font-semibold text-sm text-gray-700 mb-2">
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {exp.description.map((desc, descIndex) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Projects */}
        <Section title="PROJECTS" classic>
          <div className="space-y-5">
            {data.projects.map((proj, index) => (
              <div key={index} className="pb-2 border-b border-gray-100 last:border-none">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-gray-900">{proj.name}</h3>
                  <span className="text-sm text-gray-600">
                    {proj.startDate} – {proj.endDate}
                  </span>
                </div>
                {proj.technologies && (
                  <p className="font-semibold text-sm text-gray-700 mb-2">
                    Tech: {proj.technologies}
                  </p>
                )}
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {proj.description.map((desc, descIndex) => (
                    <li key={descIndex}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Education */}
        <Section title="EDUCATION" classic>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <span className="text-sm text-gray-600">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p className="text-sm italic text-gray-700">{edu.degree}</p>
                {edu.location && <p className="text-sm text-gray-700">{edu.location}</p>}
                {edu.gpa && (
                  <p className="text-sm text-gray-700">
                    <strong>GPA:</strong> {edu.gpa}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section title="TECHNICAL SKILLS" classic>
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
                <strong>Developer Tools:</strong> {data.skills.tools.join(', ')}
              </p>
            )}
            {data.skills.libraries?.length > 0 && (
              <p>
                <strong>Libraries:</strong> {data.skills.libraries.join(', ')}
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};
