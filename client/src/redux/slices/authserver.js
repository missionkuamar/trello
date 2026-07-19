// import { handleApiError, showSuccess } from "../../services/errorHandler";


// export const authService = {
//    login: async (credentials) => {
//       //  console.log('🔵 [SERVICE] Login function called with:', credentials.email);
        
//         try {
//             // console.log('🔐 [SERVICE] Login attempt:', { 
//             //     email: credentials.email,
//             //     timestamp: new Date().toISOString()
//             // });
            
//             const response = await axiosInstance.post('/user/login', credentials);
            
//             // console.log('✅ [SERVICE] Login successful:', {
//             //     status: response.status,
//             //     user: response.data.user,
//             //     message: response.data.message
//             // });
            
//             showSuccess(response.data.message);
//             return { 
//                 success: true, 
//                 data: response.data,
//                 user: response.data.user,
//                 message: response.data.message 
//             };
//         } catch (error) {
//             // console.error('❌ [SERVICE] Login failed:', error);
//             // console.error('Error details:', {
//             //     message: error.message,
//             //     response: error.response?.data,
//             //     status: error.response?.status
//             // });
            
//             const errorMessage = handleApiError(error);
//             return { 
//                 success: false, 
//                 error: errorMessage,
//                 data: null 
//             };
//         }
//     },

// }