import { toast } from 'sonner';

export const handleApiError = (error, customMessage = null) => {
    // console.error('🔴 API Error Details:', {
    //     message: error.message,
    //     response: error.response?.data,
    //     status: error.response?.status,
    //     config: {
    //         url: error.config?.url,
    //         method: error.config?.method,
    //         data: error.config?.data
    //     },
    //     timestamp: new Date().toISOString()
    // });

    if (customMessage) {
        toast.error(customMessage);
        return customMessage;
    }

    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection';
    } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again';
    }
    
    toast.error(errorMessage);
    return errorMessage;
};

export const showSuccess = (message) => {
   // console.log('✅ Success:', message);
    toast.success(message);
};

export const showInfo = (message) => {
  //  console.log('ℹ️ Info:', message);
    toast.info(message);
};

export const showWarning = (message) => {
    //console.log('⚠️ Warning:', message);
    toast.warning(message);
};