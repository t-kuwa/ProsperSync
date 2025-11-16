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
    attribute :repeat_enabled, :boolean, default: false
    attribute :repeat_until_date, :date

    validates :account, presence: true
    validates :amount, numericality: { greater_than: 0 }
    validates :period_type, inclusion: { in: Budget.period_types.keys }
    validates :period_year, numericality: { greater_than_or_equal_to: 1900 }
    validates :period_month,
              inclusion: { in: 1..12 },
              if: -> { period_type == "monthly" }
    validate :validate_category
    validates :repeat_until_date, presence: true, if: :repeat_enabled?
    validate :validate_repeat_range

    def attributes_for_record
      repeat_flag = repeat_enabled?
      {
        category_id:,
        amount:,
        period_type:,
        period_year:,
        period_month: period_type == "monthly" ? period_month : nil,
        name: name.present? ? name : nil,
        repeat_enabled: repeat_flag,
        repeat_until_date: repeat_flag ? repeat_until_date : nil,
      }
    end

    def repeat_enabled?
      ActiveModel::Type::Boolean.new.cast(repeat_enabled)
    end

    private

    def validate_category
      return if category_id.blank?
      return if account.categories.where(id: category_id).exists?

      errors.add(:category_id, "が不正です")
    end

    def validate_repeat_range
      return unless repeat_enabled?
      return if repeat_until_date.blank?

      period_end = Budgets::Period.new(
        period_type:,
        year: period_year,
        month: period_month,
      ).range.end

      return if repeat_until_date > period_end

      errors.add(:repeat_until_date, "は開始期間より後の日付を指定してください")
    rescue ArgumentError
      errors.add(:repeat_until_date, "が不正です")
    end
  end
end
