
export interface IResponseClient {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export interface IWsMessage {
  progress?: number;
  timeRemaining?: number;
}

// Type for the WebSocket message
export interface ILogDetails {
  userEmail: string;
  originalFilename: string;
  uniqueFilename: string;
  timeStartUpload: Date;
  timeEndUpload: Date;
  date: Date;
  fileSize: number;
  numberRows: number;
}


