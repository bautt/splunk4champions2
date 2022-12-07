import tarfile
def reset(tarinfo):
        tarinfo.uid = tarinfo.gid = 0
        tarinfo.uname = tarinfo.gname = "root"
        return tarinfo
tar = tarfile.open("current.log.gz", "w:gz")
tar.add("/var/log/current.log", filter=reset)
tar.close()
