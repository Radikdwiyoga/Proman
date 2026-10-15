import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
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
import { AITaskBreakdownModal } from './components/ai/AITaskBreakdownModal';
import { StatusSummarizerModal } from './components/ai/StatusSummarizerModal';
import { ProjectCopilotDrawer } from './components/ai/ProjectCopilotDrawer';
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
    <div className="h-screen w-screen flex bg-[#161A1D] p-0 sm:p-2 md:p-3 overflow-hidden select-none font-sans">
      {/* Outer Rounded Application Shell (Matching obantor Reference) */}
      <div className="flex-1 flex overflow-hidden rounded-none sm:rounded-[28px] shadow-2xl border border-slate-200/40 dark:border-white/10 bg-[#FAF9F6] dark:bg-[#0D1512] transition-colors relative">
        {/* Deep Forest Green Sidebar (Full height on left) */}
        <Sidebar />

        {/* Right Application Workspace: Navbar + Active View Canvas */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />
          
          <main 
            className="flex-1 flex flex-col min-w-0 overflow-auto bg-gradient-to-br from-[#FCFBF8] via-[#F8FAF8] to-[#F1F5F2] dark:from-[#0E1513] dark:via-[#111A17] dark:to-[#0D1412] text-slate-800 dark:text-readable transition-colors" 
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y'
            }}
          >
            {renderActiveView()}
          </main>

          <ProjectCopilotDrawer />
        </div>
      </div>

      {/* Global Interactive Modals & Drawers */}
      <TaskModal />
      <CreateTaskModal />
      <AITaskBreakdownModal />
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
      <ProjectProvider>
        <AppCore />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
