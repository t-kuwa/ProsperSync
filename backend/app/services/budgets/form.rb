module Budgets
  class Form
    include ActiveModel::Model
    include ActiveModel::Attributes

    attribute :account
    attribute :category_id, :integer
    attribute :amount, :integer
    attribute :period_type, :string
    attribute :period_year, :integer
    attribute :period_month, :integer
    attribute :name, :string

    validates :account, presence: true
    validates :amount, numericality: { greater_than: 0 }
    validates :period_type, inclusion: { in: Budget.period_types.keys }
    validates :period_year, numericality: { greater_than_or_equal_to: 1900 }
    validates :period_month,
              inclusion: { in: 1..12 },
              if: -> { period_type == "monthly" }
    validate :validate_category

    def attributes_for_record
      {
        category_id:,
        amount:,
        period_type:,
        period_year:,
        period_month: period_type == "monthly" ? period_month : nil,
        name: name.present? ? name : nil,
      }
    end

    private

    def validate_category
      return if category_id.blank?
      return if account.categories.where(id: category_id).exists?

      errors.add(:category_id, "が不正です")
    end
  end
end
