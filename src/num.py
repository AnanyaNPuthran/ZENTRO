import numpy as np
array=np.array([[['a','b','c'],['d','e','f'],['g','h','i']],
                [['j','k','l'],['m','n','o'],['p','q','r']],
                [['s','t','u'],['v','w','x'],['y','z','']]])
print(array.shape)
print(array.ndim)
print(array[0,0,1])