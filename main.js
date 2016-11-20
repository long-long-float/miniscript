const output = document.getElementById('output')
document.getElementById('run-btn').onclick = () => {
  output.value = ''
  class Environment {
    constructor(p) {
      this.parent = p
      this.local = {}
    }
    find(name) {
      let r
      if (this.local.hasOwnProperty(name)) return this
      else if (this.parent && (r = this.parent.find(name))) return r
      else return undefined
    }
    clone() {
      const e = new Environment(this.parent && this.parent.clone())
      e.local = Object.assign({}, this.local) // corner-cutting
      return e
    }
  }
  const env = [new Environment(null)]

  function applyLambda(lambda, args) {
    env.unshift(new Environment(lambda.lparent))
    lambda[1].forEach((n, i) => env[0].local[n] = args[i])
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
          set: (a) => {
            const e = env[0].find(a[0]) || env[0]
            return e.local[a[0]] = a[1]
          },
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
              if (a.length % 2 !== 0 && i === a.length - 1) return evalExpr(a[i]) // else
              if (evalExpr(a[i])) return evalExpr(a[i + 1]) // then
            }
            return null // should not reach
          },
        }[fst]

        let e
        if (f) {
          return f(expr.slice(1).map(evalExpr))
        } else if(s) {
          return s(expr.slice(1))
        } else if(e = env[0].find(fst)) {
          const v = e.local[fst]
          if (v instanceof Object && v[0] !== 'do') { // Array or Object
            const args = expr.slice(1).map(evalExpr)
            if (args.length == 2) v[args[0]] = args[1]
            return v[args[0]]
          } else { return v }
        } else {
          throw `unknown identifier '${fst}'`
        }
      }
    } else if (expr[0] === 'do') {
      const expr2 = Object.assign([], expr)
      expr2.lparent = env[0].clone()
      return expr2
    } else { return expr } // literal
  }
  try { evalExpr(JSON.parse(document.getElementById('src').value)) } catch (e) { output.value += e.toString() + "\n" }
}
