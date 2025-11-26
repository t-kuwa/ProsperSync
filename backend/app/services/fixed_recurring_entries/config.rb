module FixedRecurringEntries
  module Config
    DEFAULT_MONTHS_AHEAD = 24

    def self.generation_months_ahead
      (ENV["FIXED_RECURRING_GENERATION_MONTHS_AHEAD"] || DEFAULT_MONTHS_AHEAD).to_i
    end
  end
end
