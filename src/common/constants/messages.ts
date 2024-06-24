export const Messages = {
  // AUTH
  AUTH: {
    SUCCESS: {
      CHANGE_PASSWORD: 'Your password has been changed successfully',
      LOGOUT: 'Logout successful',
    },
    FAILED: {
      LOGIN: 'Username or Password is incorrect. Please try again',
      PASSWORD_NOT_CORRECT: 'Password is incorrect',
      PASSWORD_NOT_SAME: 'Old password and New password should not be the same',
      INACTIVE: 'This account is inactive',
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
      UPDATE_SELF: 'You can not update your own account',
      UPDATE_SAME_TYPE: 'You can not update to the same account type',
      CREATE_SAME_TYPE: 'You can not create the same account type',
      UPDATE_NOT_SAME_LOCATION:
        'You can only update the user within the same location',
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
    SUCCESS: {
      DELETED: 'Deleted asset successfully',
    },
    FAILED: {
      INVALID_LOCATION: 'Invalid location',
      NOT_FOUND: 'Asset not found',
      CATEGORY_NOT_FOUND: 'Category not found',
      ACCESS_DENIED: 'You do not have access to this asset',
      ALREADY_EXISTS: 'Asset already exists',
      DELETE_DENIED:
        'Cannot delete the asset because it belongs to one or more historical assignments',
      ASSET_IS_ASSIGNED: 'Asset is assigned',
      ASSET_STATE_INVALID: 'Invalid asset state',
      UPDATE_NOT_SAME_LOCATION:
        'You can only update the asset within the same location',
    },
    VALIDATE: {
      NAME: 'Name is required',
      NAME_INVALID: 'Invalid name',
      CATEGORY: 'Category is required',
      CATEGORY_INVALID: 'Invalid category',
      STATE: 'State is required',
      STATE_INVALID: 'Invalid state',
      INSTALLED_DATE: 'Installed date is required',
      INSTALLED_DATE_INVALID: 'Invalid installed date',
      SPECIFICATION: 'Specification is required',
      SPECIFICATION_INVALID: 'Invalid specification',
      LOCATION: 'Location is required',
      LOCATION_INVALID: 'Invalid location',
      ASSET_STATE_INVALID: 'Invalid asset state',
    },
  },
  CATEGORY: {
    SUCCESS: {},
    FAILED: {
      NAME_EXIST:
        'Category is already existed. Please enter a different category',
      PREFIX_EXIST:
        'Prefix is already existed. Please enter a different prefix',
      CATEGORY_CAN_NOT_BE_DELETED:
        'Category is assigned to an asset. Please delete all associated assets first',
      CATEGORY_CAN_NOT_BE_CHANGED:
        'Category is assigned to an asset. Please delete all associated assets first',
      NOT_FOUND: 'Category not found',
    },
    VALIDATE: {
      NAME: 'Name is required',
      PREFIX: 'Prefix is required',
      PREFIX_UPPER_CASE:
        'Prefix must be uppercase. Please enter a different prefix',
      PREFIX_LENGTH: 'Prefix must be 2 characters',
    },
  },
};
