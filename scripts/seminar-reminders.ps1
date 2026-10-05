# Emails chengguojerry@gmail.com about every seminar happening tomorrow
# in America/Los_Angeles. Reads data/seminars.json.
#
#   .\scripts\seminar-reminders.ps1 -DryRun
#   .\scripts\seminar-reminders.ps1 -DryRun -AsOf 2026-10-04
#
# Sending requires SMTP_USER and SMTP_PASSWORD (a Gmail app password).
# SMTP_HOST defaults to smtp.gmail.com and SMTP_PORT to 587.
param(
  [switch]$DryRun,
  [string]$AsOf = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$path = Join-Path $root "data\seminars.json"
$raw = [System.IO.File]::ReadAllText($path)
$data = $raw | ConvertFrom-Json

$tz = [TimeZoneInfo]::FindSystemTimeZoneById("Pacific Standard Time")
if ($AsOf) {
  $today = [datetime]::ParseExact($AsOf, "yyyy-MM-dd", [Globalization.CultureInfo]::InvariantCulture)
} else {
  $today = [TimeZoneInfo]::ConvertTime([datetime]::UtcNow, $tz).Date
}
$tomorrow = $today.AddDays(1).ToString("yyyy-MM-dd")
$hits = @($data.events | Where-Object { $_.date -eq $tomorrow })

function Text($obj, $prop) {
  if ($null -eq $obj) { return "" }
  $value = $obj.$prop
  if ($null -eq $value) { return "" }
  return [string]$value
}

if ($hits.Count -eq 0) {
  Write-Output "No seminars on $tomorrow (Pacific)."
  exit 0
}

$lines = New-Object System.Collections.Generic.List[string]
[void]$lines.Add("Seminars on $tomorrow (Pacific time).")
[void]$lines.Add("")

foreach ($ev in $hits) {
  $names = @()
  $topics = @()
  foreach ($talk in @($ev.presentations)) {
    foreach ($person in @($talk.speakers)) {
      $bit = Text $person "name"
      $aff = Text $person "affiliation"
      if ($aff) { $bit = "$bit ($aff)" }
      $url = Text $person "url"
      if ($url) { $bit = "$bit $url" }
      if ($bit) { $names += $bit }
    }
    $topic = Text $talk.topic "en"
    if ($topic) { $topics += $topic }
  }
  [void]$lines.Add((Text $ev.series "en"))
  [void]$lines.Add((Text $ev.field "en"))
  if ($names.Count) { [void]$lines.Add("Speaker: " + ($names -join "; ")) }
  if ($topics.Count) { [void]$lines.Add("Topic: " + ($topics -join "; ")) }
  else { [void]$lines.Add("Topic: not yet posted by the series") }
  [void]$lines.Add("Time: $($ev.start)-$($ev.end) Pacific ($($ev.durationMin) min)")
  [void]$lines.Add("Venue: $(Text $ev.venue 'en')")
  [void]$lines.Add("Place: $(Text $ev.place 'en')")
  [void]$lines.Add("Format: $($ev.format)")
  $note = Text $ev.note "en"
  if ($note) { [void]$lines.Add("Note: $note") }
  foreach ($link in @($ev.links)) {
    $label = Text $link "en"
    $url = Text $link "url"
    if ($url) { [void]$lines.Add("${label}: $url") }
  }
  [void]$lines.Add("")
}

$body = $lines -join "`r`n"
$subject = "Tomorrow: $($hits.Count) seminar"
if ($hits.Count -ne 1) { $subject += "s" }
$subject += " ($tomorrow)"

Write-Output $subject
Write-Output $body

if ($DryRun) { exit 0 }

$user = $env:SMTP_USER
$password = $env:SMTP_PASSWORD
if (-not $user -or -not $password) {
  Write-Error "SMTP_USER and SMTP_PASSWORD are not set, so the reminder was not sent."
  exit 1
}

$to = "chengguojerry@gmail.com"
if ($env:SMTP_TO) { $to = $env:SMTP_TO }
$hostName = "smtp.gmail.com"
if ($env:SMTP_HOST) { $hostName = $env:SMTP_HOST }
$port = 587
if ($env:SMTP_PORT) { $port = [int]$env:SMTP_PORT }

$message = New-Object System.Net.Mail.MailMessage
$message.From = $user
[void]$message.To.Add($to)
$message.Subject = $subject
$message.Body = $body
$message.BodyEncoding = [Text.Encoding]::UTF8
$message.SubjectEncoding = [Text.Encoding]::UTF8

$client = New-Object System.Net.Mail.SmtpClient($hostName, $port)
$client.EnableSsl = $true
$client.Credentials = New-Object System.Net.NetworkCredential($user, $password)
$client.Send($message)
$client.Dispose()
Write-Output "Sent to $to."
