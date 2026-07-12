import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const getCourses: (req: Request, res: Response) => Promise<void>;
export declare const getCourseBySlug: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getEnrolledCourses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const enrollInCourse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCourseProgress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleLessonProgress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const saveWatchProgress: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=student.courses.controller.d.ts.map