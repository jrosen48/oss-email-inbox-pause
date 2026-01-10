const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with database URL from env
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:./database.sqlite', {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: process.env.DATABASE_URL?.startsWith('postgres') ? {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  } : {}
});

// User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  graphUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'graph_user_id'
  },
  graphAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'graph_access_token'
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'token_expiry'
  },
  pausedFolderId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'paused_folder_id'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// PauseState model
const PauseState = sequelize.define('PauseState', {
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  },
  isPaused: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_paused'
  },
  subscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'subscription_id'
  },
  subscriptionExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'subscription_expiry'
  },
  clientState: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'client_state'
  }
}, {
  tableName: 'pause_state',
  timestamps: true,
  underscored: true
});

// Associations
User.hasOne(PauseState, { foreignKey: 'userId', as: 'pauseState' });
PauseState.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Initialize database (create tables)
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database models synchronized');

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
}

// Helper functions
async function getUserByEmail(email) {
  return await User.findOne({
    where: { email },
    include: [{ model: PauseState, as: 'pauseState' }]
  });
}

async function getUserById(id) {
  return await User.findByPk(id, {
    include: [{ model: PauseState, as: 'pauseState' }]
  });
}

async function getUserByGraphUserId(graphUserId) {
  return await User.findOne({
    where: { graphUserId },
    include: [{ model: PauseState, as: 'pauseState' }]
  });
}

async function createOrUpdateUser(userData) {
  const [user] = await User.upsert(userData, {
    returning: true
  });
  return user;
}

async function getPauseState(userId) {
  return await PauseState.findByPk(userId);
}

async function updatePauseState(userId, stateData) {
  const [pauseState] = await PauseState.upsert({
    userId,
    ...stateData
  }, {
    returning: true
  });
  return pauseState;
}

module.exports = {
  sequelize,
  User,
  PauseState,
  initDatabase,
  getUserByEmail,
  getUserById,
  getUserByGraphUserId,
  createOrUpdateUser,
  getPauseState,
  updatePauseState
};
