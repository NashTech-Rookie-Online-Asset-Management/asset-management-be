export const seedConfig = {
  account: {
    count: {
      min: 20,
      max: 100,
    },
    // default: P@ssw0rd
    password: '$2a$12$h2QQyk9kdTyLgoTQapgLx.cQ0mthkT0./ZO11MdLXPyb.dSbGQeWm',
    staffCodePrefix: 'SD',
  },
  asset: {
    count: {
      min: 100,
      max: 300,
    },
    assetCodeLength: 6,
  },
  assignment: {
    count: {
      min: 100,
      max: 500,
    },
  },
  returningRequest: {
    count: {
      min: 50,
      max: 200,
    },
  },
};

export default seedConfig;
