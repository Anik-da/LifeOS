import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import { bedrockService } from '../../services/bedrock';
import type { CareerApplicationItem, SkillGapItem } from '../../types';

export async function handleCareer(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  // GET /career/applications
  if (method === 'GET' && path.endsWith('/career/applications')) {
    const items = await db.queryByUserId('Career', user.userId);
    return successResponse(items);
  }

  // POST /career/skill-gap
  if (method === 'POST' && path.endsWith('/career/skill-gap')) {
    const { jobTitle, company, resumeText: customResume, jobDescriptionText: customJob } = body;

    const userDocs = await db.queryByUserId('Documents', user.userId);
    const resumeDoc = userDocs.find((d) => d.name.toLowerCase().includes('resume') || d.category === 'career');
    const jobDoc = userDocs.find((d) => d.name.toLowerCase().includes('job') || d.name.toLowerCase().includes('description'));

    const resumeText = customResume || resumeDoc?.extractedInfo?.rawText || 'Candidate with experience in Python, TypeScript, AWS, React.';
    const jobText = customJob || jobDoc?.extractedInfo?.rawText || 'Job requiring Python, TypeScript, AWS, Docker, Kubernetes.';

    const jTitle = jobTitle || jobDoc?.extractedInfo?.title || 'Junior AI & Cloud Engineer';
    const comp = company || jobDoc?.extractedInfo?.organizations?.[0]?.name || 'NovaStack Technologies';

    const careerAnalysis = await bedrockService.analyzeCareer(resumeText, jobText, jTitle, comp);

    const gapData: SkillGapItem & { interviewQuestions?: any[] } = {
      userId: user.userId,
      jobId: careerAnalysis.jobId,
      jobTitle: careerAnalysis.jobTitle,
      company: careerAnalysis.company,
      yourSkills: careerAnalysis.yourSkills,
      jobRequirements: careerAnalysis.jobRequirements,
      interviewQuestions: careerAnalysis.interviewQuestions,
      gapDetected: careerAnalysis.gapDetected,
    };
    return successResponse(gapData);
  }


  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
