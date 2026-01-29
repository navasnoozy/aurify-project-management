import { useRouter } from "next/navigation";

const useAppNavigate = () => {
  const router = useRouter();

  const goHome = () => {
    router.push("/");
  };

  const goSignin = () => {
    router.push("/signin");
  };

  return { goHome, goSignin, router };
};

export default useAppNavigate;
