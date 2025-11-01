# ==============================================
# アカウントに所属するメンバーを管理するモデル
# ==============================================
class Member < ApplicationRecord
  belongs_to :account
  belongs_to :user

  validates :role, inclusion: { in: %w[owner member] }
  validates :user_id, uniqueness: { scope: :account_id }
end
