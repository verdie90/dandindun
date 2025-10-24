# 🧪 User Management System - Testing Guide

## Test Environment Setup

### Prerequisites
- Admin account with necessary permissions
- Access to `/[locale]/admin/users` page
- Multiple user accounts with different roles
- Browser developer console open for error checking

---

## 📋 Test Cases

### 1. New User Creation Feature

#### TC-1.1: Create User with Valid Data
```
Steps:
1. Navigate to /admin/users
2. Click "New User" button
3. Fill form:
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
   - Role: "User"
4. Click "Create User"

Expected Results:
✓ Loading toast shows "Creating new user..."
✓ User is created in database
✓ Success toast shows "User 'John Doe' created successfully"
✓ Form resets and clears
✓ Dialog closes
✓ New user appears in user list
✓ Stats update (Total users +1)
✓ Success toast auto-dismisses after 5 seconds
✓ No errors in browser console
```

#### TC-1.2: Create User with Different Roles
```
Test each role assignment:
- Role: "User"
- Role: "Moderator" 
- Role: "Admin"

Expected Results:
✓ User created with correct role
✓ Role displays correctly in user list
✓ Toast shows success
✓ Role-specific permissions appear to be set
```

#### TC-1.3: Form Validation - Empty Name
```
Steps:
1. Click "New User"
2. Leave Name empty
3. Click "Create User" button (should be disabled)

Expected Results:
✓ Button is disabled (grayed out)
✓ No request sent to server
✓ No toast shown
```

#### TC-1.4: Form Validation - Invalid Email
```
Steps:
1. Click "New User"
2. Fill Name: "Test User"
3. Email: "invalid-email" (no @ symbol)
4. Fill Password: "Pass123"
5. Click "Create User"

Expected Results:
✓ Error toast shows "Please enter a valid email address"
✓ User not created
✓ Dialog stays open
✓ Form data preserved
```

#### TC-1.5: Form Validation - Short Password
```
Steps:
1. Click "New User"
2. Fill Name: "Test User"
3. Email: "test@example.com"
4. Password: "Pass1" (5 characters)
5. Click "Create User"

Expected Results:
✓ Error message shows "Password must be at least 6 characters"
✓ Create button is disabled
✓ User not created
✓ Red error background visible
```

#### TC-1.6: Form Validation - Password Mismatch
```
Steps:
1. Click "New User"
2. Fill all fields correctly
3. Password: "Pass123"
4. Confirm Password: "Pass456"
5. Click "Create User"

Expected Results:
✓ Error message shows "Passwords do not match"
✓ Red error background visible
✓ Create button is disabled
✓ User not created
```

#### TC-1.7: Permission Check - Button Visibility
```
Test with different user roles:

Admin Account:
✓ "New User" button is visible
✓ Can click button
✓ Can create users

Moderator Account:
✓ "New User" button should be hidden OR disabled
✓ Cannot create users

Regular User Account:
✓ "New User" button should be hidden
✓ Cannot access dialog
```

---

### 2. Toast Notifications - Role Changes

#### TC-2.1: Single Role Change
```
Steps:
1. Find a user in the list
2. Click role dropdown
3. Select different role
4. Confirm selection

Expected Results:
✓ Loading toast: "Updating user role..."
✓ Role updated in database
✓ Success toast: "[Name]'s role updated to [RoleName]"
✓ Toast shows for 5 seconds then auto-dismisses
✓ User list updates immediately
✓ No errors in console
```

#### TC-2.2: Bulk Role Change
```
Steps:
1. Select multiple users (checkboxes)
2. Click "Change Role" button
3. Select new role
4. Add reason (optional)
5. Confirm

Expected Results:
✓ Loading toast: "Creating new user..."
✓ Bulk action processed
✓ Success toast: "Bulk action completed: N user(s) updated"
✓ Error toast if any failures: "N user(s) failed to update"
✓ User list refreshes
✓ Selection clears
✓ Stats update
```

---

### 3. Toast Notifications - User Status

#### TC-3.1: Deactivate User
```
Steps:
1. Find active user
2. Click dropdown menu
3. Click "Deactivate"

Expected Results:
✓ Loading toast: "Deactivating user..."
✓ User status changes to "Inactive"
✓ Success toast: "[Name] has been deactivated"
✓ Toast auto-dismisses
✓ Badge color changes to gray
✓ User list updates
```

#### TC-3.2: Activate User
```
Steps:
1. Find inactive user
2. Click dropdown menu
3. Click "Activate"

Expected Results:
✓ Loading toast: "Activating user..."
✓ User status changes to "Active"
✓ Success toast: "[Name] has been activated"
✓ Toast auto-dismisses
✓ Badge color changes to green
✓ User list updates
```

#### TC-3.3: Ban User
```
Steps:
1. Find user
2. Click dropdown menu
3. Click "Ban"
4. Enter reason (optional): "Spam account"
5. Confirm

Expected Results:
✓ Loading toast: "Banning user..."
✓ User status changes to "Banned"
✓ Success toast: "[Name] has been banned - Spam account"
✓ Badge color changes to red
✓ User marked with ban icon
✓ Toast includes reason if provided
```

#### TC-3.4: Unban User
```
Steps:
1. Find banned user
2. Click dropdown menu
3. Click "Unban"

Expected Results:
✓ Loading toast: "Unbanning user..."
✓ User status changes to "Active"
✓ Success toast: "[Name] has been unbanned"
✓ Badge color changes to green
✓ Ban icon removed
```

#### TC-3.5: Delete User
```
Steps:
1. Find user
2. Click dropdown menu
3. Click "Delete"
4. Confirm in dialog

Expected Results:
✓ Confirmation dialog shows
✓ Loading toast: "Deleting user..."
✓ User status changes to "Deleted"
✓ Success toast: "[Name] has been deleted"
✓ Badge color changes to gray
✓ User marked as deleted but visible
✓ Cannot undo deletion (test if needed)
```

---

### 4. Toast Notifications - User Info

#### TC-4.1: Edit User Information
```
Steps:
1. Find user
2. Click dropdown menu
3. Click "Edit User"
4. Change name: "Jane Doe"
5. Change email: "jane@example.com"
6. Click "Save Changes"

Expected Results:
✓ Loading toast: "Updating user info..."
✓ User info updated
✓ Success toast: "'Jane Doe' information updated successfully"
✓ Dialog closes
✓ User list reflects changes
✓ Toast auto-dismisses
```

#### TC-4.2: Change Password
```
Steps:
1. Find user
2. Click dropdown menu
3. Click "Change Password"
4. New Password: "NewPass123"
5. Confirm Password: "NewPass123"
6. Click "Change Password"

Expected Results:
✓ Loading toast: "Changing password..."
✓ Password updated
✓ Success toast: "[Name]'s password has been changed"
✓ Dialog closes
✓ User can login with new password
✓ Toast auto-dismisses
```

#### TC-4.3: Password Change Validation
```
Steps:
1. Open Change Password dialog
2. Test scenarios:
   - Passwords don't match
   - Password too short
   - Empty password

Expected Results:
✓ Error message shows for each scenario
✓ Button remains disabled until valid
✓ Red error background
✓ No server request sent
```

---

### 5. Bulk Operations

#### TC-5.1: Bulk Activate Users
```
Steps:
1. Select multiple inactive users
2. Click "Activate" bulk button
3. Add reason (optional)
4. Confirm

Expected Results:
✓ Loading toast: "Creating new user..."
✓ All selected users activated
✓ Success toast: "Bulk action completed: N user(s) updated"
✓ User list updates
✓ Stats change (Active count +N)
```

#### TC-5.2: Bulk Deactivate Users
```
Steps:
1. Select multiple active users
2. Click "Deactivate" bulk button
3. Confirm

Expected Results:
✓ All selected users deactivated
✓ Success toast shown
✓ Inactive count increases
✓ Active count decreases
```

#### TC-5.3: Bulk Ban Users
```
Steps:
1. Select multiple users
2. Click "Ban" bulk button
3. Enter reason: "Policy violation"
4. Confirm

Expected Results:
✓ All selected users banned
✓ Success toast: "Bulk action completed: N user(s) updated"
✓ Banned count increases
✓ Reason logged for all users
```

#### TC-5.4: Bulk Delete Users
```
Steps:
1. Select multiple users
2. Click "Delete" bulk button
3. Confirm deletion

Expected Results:
✓ All selected users deleted
✓ Success toast shown
✓ User list updates
✓ Cannot recover deleted users (permanent)
```

---

### 6. Search and Filter

#### TC-6.1: Search by Name
```
Steps:
1. Enter name in search: "John"
2. Wait for filter

Expected Results:
✓ List shows only users with "John" in name
✓ Count shows filtered amount
✓ Toast system still works on filtered list
```

#### TC-6.2: Search by Email
```
Steps:
1. Enter email in search: "@example.com"
2. Wait for filter

Expected Results:
✓ List shows only users with "@example.com"
✓ All operations work on filtered list
```

#### TC-6.3: Filter by Status
```
Steps:
1. Select status filter: "Active"
2. Select status filter: "Inactive"
3. Select status filter: "Banned"
4. Select status filter: "All"

Expected Results:
✓ List filters correctly
✓ Each filter shows appropriate users
✓ Toast operations work on filtered list
```

---

### 7. Error Handling

#### TC-7.1: Network Error During Creation
```
Steps:
1. Start creating new user
2. Disable network/go offline
3. Click "Create User"

Expected Results:
✓ Loading toast shows
✓ Error toast shows: "[Error message]"
✓ Error message is readable
✓ User not created
✓ Form stays open for retry
```

#### TC-7.2: Duplicate Email
```
Steps:
1. Try to create user with existing email

Expected Results:
✓ Error toast shows (server returns appropriate message)
✓ User not created
✓ Dialog stays open
```

#### TC-7.3: Permission Denied
```
Steps:
1. Perform action without permission
2. (If permission check bypassed on frontend)

Expected Results:
✓ Error toast shows: "[Permission error message]"
✓ Operation fails on backend
✓ UI doesn't update
```

---

### 8. UI/UX Tests

#### TC-8.1: Responsive Design
```
Test on different screen sizes:
- Desktop (1920px)
- Tablet (768px)
- Mobile (375px)

Expected Results:
✓ Layout adjusts properly
✓ Buttons accessible on all sizes
✓ Toasts visible on all sizes
✓ Dialog readable on all sizes
✓ Form inputs work on mobile
```

#### TC-8.2: Dark Mode
```
Steps:
1. Enable dark mode
2. Test all operations

Expected Results:
✓ Toast colors adapt to dark theme
✓ Text is readable
✓ Buttons visible
✓ Form accessible
✓ Dialog styled correctly
```

#### TC-8.3: Light Mode
```
Steps:
1. Enable light mode
2. Test all operations

Expected Results:
✓ Toast colors adapt to light theme
✓ Professional appearance
✓ All text readable
✓ Good contrast
```

---

### 9. Toast Behavior

#### TC-9.1: Toast Auto-Dismiss
```
Steps:
1. Perform successful action
2. Watch toast notification
3. Count seconds until it dismisses

Expected Results:
✓ Success toast appears
✓ Toast displays for approximately 5 seconds
✓ Toast auto-dismisses without user action
✓ No trace left after dismiss
```

#### TC-9.2: Error Toast Persistence
```
Steps:
1. Perform action that causes error
2. Watch error toast

Expected Results:
✓ Error toast appears
✓ Error toast does NOT auto-dismiss
✓ User can dismiss by clicking X
✓ Error toast stays visible until dismissed
```

#### TC-9.3: Multiple Toasts
```
Steps:
1. Perform multiple actions quickly
2. Create several toasts at once

Expected Results:
✓ Multiple toasts stack
✓ Each displays correctly
✓ No overlap or collision
✓ Each dismisses independently
✓ Professional stacking order
```

---

### 10. Performance Tests

#### TC-10.1: Large User List
```
Steps:
1. System with 1000+ users
2. Perform filtering
3. Perform bulk operations

Expected Results:
✓ Filter is responsive
✓ No lag in search
✓ Bulk operations complete in reasonable time
✓ UI doesn't freeze
✓ Toasts display without delay
```

#### TC-10.2: Rapid Actions
```
Steps:
1. Perform multiple actions in quick succession
2. Click buttons rapidly
3. Create new users quickly

Expected Results:
✓ All toasts display
✓ No missed notifications
✓ Operations queue properly
✓ No duplicate operations
```

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________
OS: ___________
Screen Size: ___________

Test Results:
[ ] TC-1.1: ✓ Pass / ✗ Fail / ⊙ N/A
[ ] TC-1.2: ✓ Pass / ✗ Fail / ⊙ N/A
[ ] TC-1.3: ✓ Pass / ✗ Fail / ⊙ N/A
... (all test cases)

Issues Found:
1. ___________
2. ___________
3. ___________

Notes:
___________
___________

Overall Result: ✓ PASS / ✗ FAIL
```

---

## 🔍 Known Behaviors to Verify

### Expected Behaviors
1. ✓ New User button only visible with permissions
2. ✓ Form validation prevents invalid submissions
3. ✓ All toasts show within 100ms of action
4. ✓ Success toasts auto-dismiss after ~5 seconds
5. ✓ User list refreshes immediately after action
6. ✓ Stats update after user operations
7. ✓ Loading states show during operations
8. ✓ Errors display user-friendly messages
9. ✓ No console errors during operations
10. ✓ All operations log to audit trail

### Not Expected (Report if Found)
1. ✗ Form submits without validation
2. ✗ Toasts don't show
3. ✗ User list doesn't update
4. ✗ Permissions not checked
5. ✗ Console errors appear
6. ✗ Buttons remain disabled after success
7. ✗ Duplicate users created
8. ✗ Password stored in plain text

---

## 🚀 Test Execution Checklist

- [ ] Environment setup complete
- [ ] All browsers tested
- [ ] Permission levels tested
- [ ] Network conditions tested
- [ ] Different screen sizes tested
- [ ] Dark/light modes tested
- [ ] Error scenarios tested
- [ ] Performance tested
- [ ] Edge cases covered
- [ ] Results documented
- [ ] Issues logged
- [ ] Regressions checked
- [ ] Sign-off obtained

---

## 📝 Bug Report Template

```
Bug ID: ___________
Title: ___________
Severity: Critical / High / Medium / Low
Status: New / In Progress / Fixed / Verified

Description:
___________

Steps to Reproduce:
1. ___________
2. ___________
3. ___________

Expected Result:
___________

Actual Result:
___________

Screenshots/Logs:
[Attach if applicable]

Environment:
- Browser: ___________
- OS: ___________
- Screen Size: ___________
- User Role: ___________
```

---

## ✅ Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | _______ | _______ | ✓/✗ |
| Dev Lead | _______ | _______ | ✓/✗ |
| Product Owner | _______ | _______ | ✓/✗ |

---

## 📞 Support

For testing issues or questions:
1. Check test logs for details
2. Review browser console
3. Verify test environment
4. Check user permissions
5. Contact development team

**Last Updated**: 2025-10-24
**Version**: 1.0.0
