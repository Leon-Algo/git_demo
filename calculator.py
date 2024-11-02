def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "错误：除数不能为零"
    return a / b

if __name__ == "__main__":
    print("简单计算器")
    print("1 + 1 =", add(1, 1))
    print("5 - 2 =", subtract(5, 2))
    print("4 × 3 =", multiply(4, 3))
    print("8 ÷ 2 =", divide(8, 2)) 