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
        return applyLambda(lambda, args.slice(1))
      } else {
        const f = {
          set: (a) => env[0][a[0]] = a[1],
          print: (a) => (output.value += a[0] + "\n") && a[0],
          "+": (a) => a.reduce((x, y) => x + y),
          "-": (a) => a.reduce((x, y) => x - y),
          "*": (a) => a.reduce((x, y) => x * y),
          "/": (a) => a.reduce((x, y) => x / y),
          "%": (a) => a[0] % a[1],
          "=": (a) => a[0] === a[1],
          ">": (a) => a[0] > a[1],
          "<": (a) => a[0] < a[1],
          ">=": (a) => a[0] >= a[1],
          "<=": (a) => a[0] <= a[1],
          range: (a) => {
            const r = []
            for (let i = a[0]; i <= a[1]; i++) r.push(i)
            return r
          }
        }[fst]
        const s = {
          array: (a) => a,
          if: (a) => evalExpr(a[0]) ? evalExpr(a[1]) : evalExpr(a[2]),
          for: (a) => {
            const coll = evalExpr(a[0])
            const cb = evalExpr(a[1])
            const r = []
            if (Array.isArray(coll)) {
              for (let i = 0; i < coll.length; i++) {
                r.push(applyLambda(cb, [coll[i]]))
              }
            } else {
              const keys = Object.keys(coll)
              for (let i = 0; i < keys.length; i++) {
                r.push(applyLambda(cb, [keys[i], coll[keys[i]]]))
              }
            }
            return r
          },
          switch: (a) => {
            let r = null
            for (let i = 0; i < a.length; ) {
              if (a.length % 2 !== 0 && i === a.length - 1) {
                r = evalExpr(a[i])
                break
              }

              if (evalExpr(a[i])) {
                r = evalExpr(a[i + 1])
                break
              }

              i += 2
            }
            return r
          },
        }[fst]

        if (f) {
          return f(expr.slice(1).map(evalExpr))
        } else if(s) {
          return s(expr.slice(1))
        } else if(env[0].hasOwnProperty(fst)) {
          return env[0][fst]
        } else {
          throw `unknown identifier '${fst}'`
        }
      }
    } else { return expr } // literal
  }
  evalExpr(src)
}
