module Budgets
  class Destroyer
    def self.call(budget:)
      new(budget:).call
    end

    def initialize(budget:)
      @budget = budget
    end

    def call
      budget.destroy!
      { id: budget.id }
    end

    private

    attr_reader :budget
  end
end
