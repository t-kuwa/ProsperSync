# ==============================================
# ユーザーのグループアカウントを管理するモデル
# ==============================================
class Account < ApplicationRecord
  belongs_to :owner, class_name: "User"

  has_many :members, dependent: :destroy
  has_many :users, through: :members
  has_many :expenses, dependent: :destroy
  has_many :incomes, dependent: :destroy

  validates :name, presence: true
end
