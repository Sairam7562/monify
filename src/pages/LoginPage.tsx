
import AuthForm from '@/components/auth/AuthForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-8">
      <a href="/" className="mb-8">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-navido-blue-600 to-navido-green-600">
          Finance Navido
        </span>
      </a>
      
      <AuthForm />
      
      <p className="mt-8 text-sm text-gray-500">
        By signing up, you agree to our{' '}
        <a href="#" className="text-navido-blue-500 hover:underline">Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="text-navido-blue-500 hover:underline">Privacy Policy</a>.
      </p>
    </div>
  );
};

export default LoginPage;
