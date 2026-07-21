import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '../components/ui/Toast';

export const AppProvider = ({ children }) => {
    return (
        <BrowserRouter>
            <QueryProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </QueryProvider>
        </BrowserRouter>
    );
};