# ==============================================
# ユーザーを管理するモデル
# ==============================================
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  has_many :accounts, foreign_key: :owner_id, inverse_of: :owner, dependent: :destroy
  has_many :members, dependent: :destroy
  has_many :joined_accounts, through: :members, source: :account
  has_many :expenses, through: :accounts
  has_many :incomes, through: :accounts

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end
