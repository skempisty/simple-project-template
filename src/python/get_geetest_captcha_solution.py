from solver import PuzzleSolver
solver = PuzzleSolver("../../captcha_key.png", "../../captcha_lock.png")
solution = solver.get_position()
print(solution)
