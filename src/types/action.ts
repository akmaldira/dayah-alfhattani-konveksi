export type ActionError = {
  status: "error";
  error: {
    message: string;
  } & Record<string, string | number>;
  redirect?: string;
};

export type ActionSuccess<T> = {
  status: "success";
  data: T;
  message?: string;
  redirect?: string;
};

export type ActionResponse<T> = ActionError | ActionSuccess<T>;
