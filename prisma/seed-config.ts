export const seedConfig = {
  account: {
    count: {
      min: 20,
      max: 100,
    },
    // default: P@ssw0rd
    password: '$2a$10$luCbCsx0IIYW4S5NGb9mG.fNdA.N772/64ZfjeQjO2XT7hReHnSNe',
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
