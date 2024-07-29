import { apiService, ApiService, fetcher } from "@/api";
import { SignInFormSchema, SignInFormValues } from "@/util/Type";

class AuthAction {
  async signIn(formData: FormData): Promise<any> {
    const signInFormValues = {
      identifier: formData.get("identifier") as string,
      password: formData.get("password") as string,
    };

    const formResult = SignInFormSchema.safeParse(signInFormValues);
    if (!formResult.success) {
      let errorMessage = "";
      formResult.error.errors.forEach((error) => {
        errorMessage += error.message + "\n";
      });

      return {
        error: errorMessage,
      };
    }

    const response = apiService.post(
      "/auth/signin",
      formResult.data as SignInFormValues
    ) as any;

    return response;
  }
}

export default new AuthAction();
