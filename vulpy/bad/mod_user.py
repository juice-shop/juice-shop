from flask import Blueprint, render_template, redirect, request, g, session, make_response, flash
import libmfa
import libuser
import libsession

mod_user = Blueprint('mod_user', __name__, template_folder='templates')


@mod_user.route('/login', methods=['GET', 'POST'])
def do_login():

    session.pop('username', None)

    if request.method == 'POST':

        username = request.form.get('username')
        password = request.form.get('password')
        otp = request.form.get('otp')

        username = libuser.login(username, password)

        if not username:
            flash("Invalid user or password");
            return render_template('user.login.mfa.html')

        if libmfa.mfa_is_enabled(username):
            if not libmfa.mfa_validate(username, otp):
                flash("Invalid OTP");
                return render_template('user.login.mfa.html')

        response = make_response(redirect('/'))
        response = libsession.create(response=response, username=username)
        return response

    return render_template('user.login.mfa.html')


@mod_user.route('/create', methods=['GET', 'POST'])
def do_create():

    session.pop('username', None)

    if request.method == 'POST':

        username = request.form.get('username')
        password = request.form.get('password')
        #email = request.form.get('password')
        if not username or not password:
            flash("Please, complete username and password")
            return render_template('user.create.html')

        libuser.create(username, password)
        flash("User created. Please login.")
        return redirect('/user/login')

        #session['username'] = libuser.login(username, password)

        #if session['username']:
        #    return redirect('/')

    return render_template('user.create.html')


@mod_user.route('/chpasswd', methods=['GET', 'POST'])
def do_chpasswd():

    if request.method == 'POST':

        password = request.form.get('password')
        password_again = request.form.get('password_again')

        if password != password_again:
            flash("The passwords don't match")
            return render_template('user.chpasswd.html')

        if not libuser.password_complexity(password):
            flash("The password don't comply our complexity requirements")
            return render_template('user.chpasswd.html')

        libuser.password_change(g.session['username'], password) # = libuser.login(username, password)
        flash("Password changed")

    return render_template('user.chpasswd.html')

