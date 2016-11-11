const output = document.getElementById('output')
document.getElementById('run-btn').onclick = () => {
  output.value = ''
  const src = JSON.parse(document.getElementById('src').value)
  const env = [{}]

  function applyLambda(lambda, args) {
    env.unshift({})
    lambda[1].forEach((n, i) => env[0][n] = args[i])
    const r = lambda.slice(2).map(evalExpr)[lambda.length - 3]
    env.shift()
    return r
  }

  function evalExpr(expr) {
    if (Array.isArray(expr) && expr[0] !== 'do') { // function call
      const fst = evalExpr(expr[0])
      if (fst[0] == 'do') {
        return applyLambda(fst, expr.slice(1))
      } else {
        const f = {
          set: (a) => env[0][a[0]] = a[1],
          print: (a) => (output.value += a[0] + "\n") && a[0],
          "+": (a) => a.reduce((x, y) => x + y), "-": (a) => a.reduce((x, y) => x - y),
          "*": (a) => a.reduce((x, y) => x * y), "/": (a) => a.reduce((x, y) => x / y),
          "%": (a) => a[0] % a[1],
          "=": (a) => a[0] === a[1],
          ">": (a) => a[0] > a[1],    "<": (a) => a[0] < a[1],
          ">=": (a) => a[0] >= a[1], "<=": (a) => a[0] <= a[1],
          range: (a) => Array.from(Array(a[1] - a[0] + 1).keys(), (i) => a[0] + i),
          array: (a) => a,
        }[fst]
        const s = {
          if: (a) => evalExpr(a[0]) ? evalExpr(a[1]) : evalExpr(a[2]),
          for: (a) => {
            const coll = evalExpr(a[0])
            const cb = evalExpr(a[1])
            return Array.isArray(coll) ?
                coll.map((elem) => applyLambda(cb, [elem]))
              : Object.keys(coll).map((key) => applyLambda(cb, [key, coll[key]]))
          },
          switch: (a) => {
            for (let i = 0; i < a.length; i += 2) {
              if (a.length % 2 !== 0 && i === a.length - 1) { // else
                return evalExpr(a[i])
              }

              if (evalExpr(a[i])) { // then
                return evalExpr(a[i + 1])
              }
            }
            return null // should not reach
          },
        }[fst]

        if (f) {
          return f(expr.slice(1).map(evalExpr))
        } else if(s) {
          return s(expr.slice(1))
        } else if(env[0].hasOwnProperty(fst)) {
          const v = env[0][fst]
          const args = expr.slice(1).map(evalExpr)
          if (v instanceof Object) { // Array or Object
            if (args.length == 2) v[args[0]] = args[1]
            return v[args[0]]
          } else { return v }
        } else {
          throw `unknown identifier '${fst}'`
        }
      }
    } else { return expr } // literal
  }
  evalExpr(src)
}
