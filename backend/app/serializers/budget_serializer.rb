class BudgetSerializer
  def initialize(budget, progress: nil)
    @budget = budget
    @progress = progress
  end

  def as_json(*)
    {
      id: budget.id,
      account_id: budget.account_id,
      category_id: budget.category_id,
      amount: budget.amount,
      period_type: budget.period_type,
      period_month: budget.period_month,
      period_year: budget.period_year,
      name: budget.name,
      period_label: budget.period.label,
      current_spent: progress_value(:current_spent),
      remaining: progress_value(:remaining),
      percentage: progress_value(:percentage),
      created_at: budget.created_at,
      updated_at: budget.updated_at,
      category: serialize_category(budget.category),
    }
  end

  def self.collection(entries)
    entries.map do |entry|
      budget = entry.fetch(:budget)
      new(budget, progress: entry).as_json
    end
  end

  private

  attr_reader :budget, :progress

  def progress_value(key)
    progress&.fetch(key, nil)
  end

  def serialize_category(category)
    return unless category

    {
      id: category.id,
      account_id: category.account_id,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      position: category.position,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }
  end
end
