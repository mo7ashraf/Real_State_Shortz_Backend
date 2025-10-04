@extends('include.app')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="alert alert-warning mt-4">
            <h4 class="alert-heading">googleCredentials.json Missing</h4>
            <p>The <code>googleCredentials.json</code> file at the project root is empty or missing. The dashboard depends on valid Firebase service account credentials for FCM features.</p>
            <hr>
            <p class="mb-0">
                Follow the guide to generate and add the file:
                <a href="https://docs.retrytech.com/shortzz/shortzz_backend#setup_fcm" class="fw-bold" target="_blank">How to add googleCredentials.json</a>
            </p>
        </div>
    </div>
@endsection
