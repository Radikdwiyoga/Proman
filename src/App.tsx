import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { KanbanView } from './components/views/KanbanView';
import { TimelineView } from './components/views/TimelineView';
import { CalendarView } from './components/views/CalendarView';
import { ListView } from './components/views/ListView';
import { ProjectManagementView } from './components/projects/ProjectManagementView';
import { RiskAnalysisDashboard } from './components/ai/RiskAnalysisDashboard';
import { ResourceAllocationView } from './components/ai/ResourceAllocationView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { StatusSummarizerModal } from './components/ai/StatusSummarizerModal';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';

const AppCore: React.FC = () => {
  const { 
    isAuthenticated, 
    activeView, 
    isChangePasswordModalOpen, 
    setIsChangePasswordModalOpen 
  } = useProject();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'kanban':
        return <KanbanView />;
      case 'timeline':
        return <TimelineView />;
      case 'calendar':
        return <CalendarView />;
      case 'list':
        return <ListView />;
      case 'project_management':
        return <ProjectManagementView />;
      case 'risk_dashboard':
        return <RiskAnalysisDashboard />;
      case 'resource_allocation':
        return <ResourceAllocationView />;
      case 'admin_settings':
        return <AdminSettingsView />;
      default:
        return <KanbanView />;
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden select-none font-sans bg-[#F0F5FD] dark:bg-[#0B1120] transition-colors relative">
      {/* Royal Blue Sidebar (Full height on left) */}
      <Sidebar />

      {/* Right Application Workspace: Navbar + Active View Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        
        <main 
          className="flex-1 flex flex-col min-w-0 overflow-auto bg-gradient-to-br from-[#F8FAFD] via-[#F0F5FD] to-[#E6F0FD] dark:from-[#0B1120] dark:via-[#0E1726] dark:to-[#0B1120] text-slate-800 dark:text-readable transition-colors" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
        >
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <TaskModal />
      <CreateTaskModal />
      <StatusSummarizerModal />
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProjectProvider>
          <AppCore />
        </ProjectProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
