import { GoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../apis/auth";

const Login = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if(!credentialResponse.credential){
            return "Something went wrong."
          }
          const data = await googleAuth(credentialResponse.credential);
          console.log(data);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        size="large"
        shape="pill"
        text="continue_with"
        theme="filled_blue"
        useOneTap
      />
    </div>
  );
};

export default Login;
