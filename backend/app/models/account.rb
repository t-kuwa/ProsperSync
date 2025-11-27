require "securerandom"

# ==============================================
# ユーザーのグループアカウントを管理するモデル
# ==============================================
class Account < ApplicationRecord
  belongs_to :owner, class_name: "User"

  has_many :memberships, inverse_of: :account, dependent: :destroy
  has_many :users, through: :memberships
  has_many :expenses, dependent: :destroy
  has_many :incomes, dependent: :destroy
  has_many :fixed_recurring_entries, dependent: :destroy
  has_many :issued_invoices, class_name: "Invoice", foreign_key: :issuer_account_id, dependent: :destroy
  has_many :received_invoices, class_name: "Invoice", foreign_key: :payer_account_id, dependent: :nullify
  has_many :categories, dependent: :destroy
  has_many :budgets, dependent: :destroy
  has_many :account_invitations, dependent: :destroy

  enum :account_type, { personal: 0, team: 1 }

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :account_type, presence: true
  validates :owner, presence: true, if: :personal?

  before_validation :ensure_slug, on: :create
  before_destroy :prevent_personal_destroy, prepend: true

  private

  def ensure_slug
    self.slug ||= SecureRandom.uuid
  end

  def prevent_personal_destroy
    return unless personal?

    errors.add(:base, "個人用ワークスペースは削除できません。")
    throw :abort
  end
end
