def add(x, y):
	return x + y

def subtract(x, y):
	return x - y

def multiply(x, y):
	return x * y

def divide(x, y):
	if y == 0:
		return "Error: Division by zero"
	return x / y

def main():
	print("Select operation:")
	print("1. Add")
	print("2. Subtract")
	print("3. Multiply")
	print("4. Divide")

	choice = input("Enter choice (1/2/3/4): ")

	if choice not in ('1', '2', '3', '4'):
		print("Invalid input")
		return

	try:
		num1 = float(input("Enter first number: "))
		num2 = float(input("Enter second number: "))
	except ValueError:
		print("Invalid number input")
		return

	if choice == '1':
		print(f"{num1} + {num2} = {add(num1, num2)}")
	elif choice == '2':
		print(f"{num1} - {num2} = {subtract(num1, num2)}")
	elif choice == '3':
		print(f"{num1} * {num2} = {multiply(num1, num2)}")
	elif choice == '4':
		print(f"{num1} / {num2} = {divide(num1, num2)}")

if __name__ == "__main__":
	main()
