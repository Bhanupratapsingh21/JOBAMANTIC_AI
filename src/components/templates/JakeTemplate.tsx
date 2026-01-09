import { TemplateProps } from '@/types/resume';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Section } from './shared/Section';

export const JakeTemplate = ({ data }: TemplateProps) => {
  return (
    <div
      className="
        mx-auto bg-white text-gray-800 font-serif
         min-h-[287mm]    /* A4 size */
        p-[10mm]                   /* Safe margins for PDF */
        box-border
        flex flex-col
        justify-start
        leading-relaxed
         print:h-[287mm]
      "
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {data.personalInfo.fullName}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-700 mb-2">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            {data.personalInfo.phone}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-600" />
            {data.personalInfo.email}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            {data.personalInfo.location}
          </span>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600">
          {data.personalInfo.linkedin && <span>LinkedIn: {data.personalInfo.linkedin}</span>}
          {data.personalInfo.github && (
            <>
              <span>•</span>
              <span>GitHub: {data.personalInfo.github}</span>
            </>
          )}
        </div>
      </div>

      {/* Education */}
      <Section title="Education">
        <div className="space-y-3">
          {data.education.map((edu, index) => (
            <div key={index} className="pb-1 border-b border-gray-100 last:border-none">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <p className="text-sm italic text-gray-700">
                    {edu.degree}
                    {edu.minor && `, ${edu.minor}`}
                  </p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700">{edu.location}</p>
              {edu.gpa && <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience">
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="pb-1 border-b border-gray-100 last:border-none">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.position}</h3>
                  <p className="text-sm italic text-gray-700">{exp.company}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {exp.startDate} — {exp.endDate}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1">{exp.location}</p>
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
      <Section title="Projects">
        <div className="space-y-4">
          {data.projects.map((proj, index) => (
            <div key={index} className="pb-1 border-b border-gray-100 last:border-none">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">{proj.name}</h3>
                  {proj.technologies && (
                    <p className="text-sm italic text-gray-700">Tech: {proj.technologies}</p>
                  )}
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {proj.startDate} — {proj.endDate}
                </span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {proj.description.map((desc, descIndex) => (
                  <li key={descIndex}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Skills */}
      <Section title="Technical Skills">
        <div className="text-sm text-gray-700 space-y-1">
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
  );
};
