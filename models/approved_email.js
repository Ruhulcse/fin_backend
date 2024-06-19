const { Sequelize, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const ApprovedEmail = sequelize.define(
    "ApprovedEmail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "approved_emails",
      timestamps: true,
    }
  );
  return ApprovedEmail;
};
