# 🚀 Release Notes - v2.0.0

## 📱 New Features
• **Phone Number Support**: Optional phone field in orders with click-to-call functionality
• **UPI QR Code**: QR code icon in app bar opens UPI payment modal
• **Smart Fallback**: Copy number option on iOS Simulator when phone app unavailable

## 🔧 Backend Improvements
• **Class-Validator**: Replaced custom validation with industry-standard validation
• **Phone Number API**: All endpoints now support optional phone numbers
• **Enhanced DTOs**: Created validation DTOs for orders, status, and payment updates
• **Better Error Messages**: More descriptive validation error responses

## 🧪 Testing Infrastructure
• **Vitest Integration**: Replaced Jest with faster Vitest testing framework
• **Comprehensive Tests**: Integration tests for API flows and validation unit tests
• **Test Coverage**: Focused on meaningful functionality over code coverage metrics

## 🚀 Deployment & CI/CD
• **Release Notes Input**: Manual input for custom release notes during deployment
• **Tag Management**: Custom tag name input for semantic versioning
• **Environment Fix**: Proper `EXPO_PUBLIC_API_URL` handling for production builds
• **URL Display**: Automatic generation of frontend deployment URLs

## 🎨 UI/UX Improvements
• **Clickable Phone Numbers**: Blue underlined phone numbers in order cards
• **QR Code Modal**: Professional modal with instructions and close button
• **Visual Hierarchy**: Improved order card layout and information organization

## 🔒 Non-Functional Improvements
• **TypeScript**: Enhanced type safety with proper interfaces
• **Code Organization**: Better separation with DTOs and middleware
• **Performance**: Improved database queries and test cleanup
• **Maintainability**: Centralized validation and well-organized test structure

## 🐛 Bug Fixes
• **iOS Simulator**: Fixed phone app compatibility issues
• **Environment Variables**: Resolved production API URL configuration
• **Database Schema**: Fixed foreign key constraint issues in tests
• **Validation Logic**: Improved error handling and validation messages

---

**Total Changes**: 15+ features, 8+ bug fixes, 5+ infrastructure improvements  
**Breaking Changes**: None  
**Migration Required**: None
