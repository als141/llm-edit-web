import { FiEdit3 } from 'react-icons/fi';

interface HeaderProps {
  fileName: string;
  isFileLoaded: boolean;
}

const Header: React.FC<HeaderProps> = ({ fileName, isFileLoaded }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <FiEdit3 className="text-blue-500 dark:text-blue-400 text-2xl mr-2" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">LLM-Edit</h1>
      </div>
      
      {isFileLoaded && (
        <div className="ml-4 flex-1 flex items-center">
          <span className="mx-4 text-gray-400">|</span>
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-md">
            {fileName}
          </h2>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <a
          href="https://github.com/als141/llm-edit"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;