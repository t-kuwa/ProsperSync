# ==============================================
# ユーザーを管理するモデル
# ==============================================
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null

  has_many :accounts, foreign_key: :owner_id, inverse_of: :owner, dependent: :destroy
  has_many :memberships, inverse_of: :user, dependent: :destroy
  has_many :joined_accounts, through: :memberships, source: :account
  has_many :expenses, through: :accounts
  has_many :incomes, through: :accounts
  has_many :account_invitations, foreign_key: :inviter_id, inverse_of: :inviter, dependent: :nullify

  belongs_to :primary_account, class_name: "Account", optional: true

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  after_create :create_personal_workspace!

  def personal_account
    primary_account || accounts.personal.first
  end

  private

  def create_personal_workspace!
    Workspace::ProvisionPersonal.call(user: self)
  end
end
