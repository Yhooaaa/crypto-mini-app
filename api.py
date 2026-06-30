from aiohttp import web
from database import get_user, update_balances

_COINS = ['usdt', 'btc', 'eth', 'bnb', 'xrp', 'sol', 'ton']


def _cors(response: web.Response) -> web.Response:
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


async def _options(request: web.Request) -> web.Response:
    return _cors(web.Response())


async def balance_get(request: web.Request) -> web.Response:
    uid = request.rel_url.query.get('user_id', '')
    if not uid.lstrip('-').isdigit():
        return _cors(web.json_response({'error': 'missing_user_id'}, status=400))

    user = await get_user(int(uid))
    if not user:
        return _cors(web.json_response({'error': 'not_found'}, status=404))

    balances = {c: user[f'{c}_balance'] for c in _COINS}
    return _cors(web.json_response(balances))


async def trade_post(request: web.Request) -> web.Response:
    try:
        data   = await request.json()
        uid    = int(data['user_id'])
        side   = data['side']            # 'buy' | 'sell'
        symbol = data['symbol'].lower()  # 'btc' | 'eth' | ...
        amount = float(data['amount_usdt'])
        price  = float(data['price'])
    except Exception:
        return _cors(web.json_response({'error': 'bad_request'}, status=400))

    if symbol not in _COINS or symbol == 'usdt':
        return _cors(web.json_response({'error': 'invalid_symbol'}, status=400))
    if amount <= 0 or price <= 0:
        return _cors(web.json_response({'error': 'invalid_amount'}, status=400))

    user = await get_user(uid)
    if not user:
        return _cors(web.json_response({'error': 'not_found'}, status=404))

    usdt_bal = float(user['usdt_balance'])
    coin_bal = float(user[f'{symbol}_balance'])
    coin_qty = amount / price

    if side == 'buy':
        if usdt_bal < amount:
            return _cors(web.json_response({'error': 'insufficient_usdt'}, status=400))
        new_usdt = usdt_bal - amount
        new_coin = coin_bal + coin_qty
    elif side == 'sell':
        if coin_bal < coin_qty:
            return _cors(web.json_response({'error': 'insufficient_coin'}, status=400))
        new_usdt = usdt_bal + amount
        new_coin = coin_bal - coin_qty
    else:
        return _cors(web.json_response({'error': 'invalid_side'}, status=400))

    await update_balances(uid, **{
        'usdt_balance': new_usdt,
        f'{symbol}_balance': new_coin,
    })

    user_upd = await get_user(uid)
    balances = {c: user_upd[f'{c}_balance'] for c in _COINS}
    return _cors(web.json_response(balances))


def make_api_app() -> web.Application:
    app = web.Application()
    app.router.add_options('/api/balance', _options)
    app.router.add_options('/api/trade',   _options)
    app.router.add_get('/api/balance', balance_get)
    app.router.add_post('/api/trade',  trade_post)
    return app
