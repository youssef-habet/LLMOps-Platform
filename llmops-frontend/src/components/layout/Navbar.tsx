
export default function Navbar() {
  return (
    // Removed border-b and border colors. Kept it transparent to blend with the app shell.
    <header className="h-16 bg-white dark:bg-black flex items-center justify-end px-6 transition-colors duration-200">
      
    
      <div className="flex items-center space-x-4">
        
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-900 dark:text-white font-medium text-sm">
          C
        </div>
      </div>
    </header>
  );
}