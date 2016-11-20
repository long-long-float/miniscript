# miniscript
a minimal script language like lisp

```json
["for", ["range", 1, 100], ["do", ["n"],
  ["print", ["switch",
    ["=", ["%", ["n"], 15], 0], "FizzBuzz",
    ["=", ["%", ["n"], 3], 0],  "Fizz",
    ["=", ["%", ["n"], 5], 0],  "Buzz",
    ["n"]
  ]]
]]
```

## syntax

It uses JSON. It has only two form.

* [_funname_, _args_...]
    * apply function or special form
* lambda (["do", _args_, _exprs_...]) (it is closure) and other (such as `1`, `"text"`, `3.14`, `{ "a": 1 }`)
    * value

## apply function

### function

* ["set", _name_, _value_]
    * set _value_ to _name_ variable
* ["print", _value_]
    * print _value_ to output area
* [_op_, _values_...]
    * _op_: "+", "-", "*", "/"
* [_op_, _value1_, _value2_]
    * _op_: "=", ">", "<", ">=", "<="
* ["range", _begin_, _end_]
    * creates sequence (only integer)

### special form

* ["array", _values_...]
* ["if", _condition_, _then_, _else_]
* ["for", _collection_, _callback_]
    * _collection_ is array or object
* ["switch", _cond1_, _then1_, _cond2_, _then2_, ..., _else_]

### variable

A variable is implemented as function. For example, variable "n"'s value can be obtained by `["n"]`.

Element of array or object can be accessed by below.

* array
    * get [_varname_ _index_]
    * set [_varname_ _index_, _value_]
* object
    * get [_varname_, _key_]
    * set [_varname_ _key_, _value_]

### lambda

A lambda can be applied.

## literal

It's values follow JSON(JavaScript) except array.
