json.array! @incomes do |income|
  json.partial! "api/v1/incomes/income", income: income
end
