export const Messages = {
  // AUTH
  AUTH: {
    SUCCESS: {
      CHANGE_PASSWORD: 'Your password has been changed successfully',
      LOGOUT: 'Logout successful',
    },
    FAILED: {
      LOGIN: 'Username or password is incorrect. Please try again',
      PASSWORD_NOT_CORRECT: 'Password is incorrect',
      PASSWORD_NOT_SAME: 'Old password and new password should not be the same',
    },
    VALIDATE: {
      USER_NAME: 'Username is required',
      PASSWORD: 'Password is required',
      REFRESH: 'Refresh is required',
    },
  },
  TOKEN: {
    SUCCESS: {},
    FAILED: {
      REFRESH_INVALID: 'Invalid refresh token',
      REFRESH_EXPIRED: 'Invalid or expired refresh token',
    },
    VALIDATE: {},
  },
  USER: {
    SUCCESS: {
      DISABLED: 'Disabled successfully',
    },
    FAILED: {
      DISABLED: 'This account is disabled',
      NOT_FOUND: 'User not found',
      CREATE: 'Failed to create user',
      UPDATE: 'Failed to update user',
      DELETE: 'Failed to delete user',
      UNDER_AGE: 'User is under 18. Please select a different date',
      JOINED_WEEKEND:
        'Joined date is Saturday or Sunday. Please select a different date',
      JOINED_AFTER_DOB:
        'Joined date is not later than Date of Birth. Please select a different date',
      JOINED_DATE_UNDER_AGE:
        'Joined date must be at least 18 years after the date of birth',
      JOINED_DATE_INVALID: 'Invalid joined date',
      DISABLED_FAILED:
        'There are valid assignments belonging to this user. Please close all assignments before disabling user.',
    },
    VALIDATE: {
      DOB: 'Date of Birth is required',
      JOINED_DATE: 'Joined Date is required',
      GENDER: 'Gender is required',
      GENDER_INVALID: 'Invalid gender',
      ACCOUNT_TYPE: 'Account type is required',
      ACCOUNT_TYPE_INVALID: 'Invalid account type',
      LOCATION: 'Location is required',
      LOCATION_INVALID: 'Invalid location',
    },
  },
  ASSET: {
    SUCCESS: {},
    FAILED: {
      INVALID_LOCATION: 'Invalid location',
      NOT_FOUND: 'Asset not found',
      CATEGORY_NOT_FOUND: 'Some categories do not exist',
      ACCESS_DENIED: 'You do not have access to this asset',
    },
    VALIDATE: {},
  },
};
