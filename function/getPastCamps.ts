import { prisma } from '@/prisma'

export async function getPastCamps(studentClass: number) {
    const today = new Date().toISOString().split('T')[0];
    const camps = await prisma.camp.findMany({
        where: {
            class: studentClass,
        }
    })

    const todayTimestamp = new Date(today).getTime();

    const pastCamps = camps.filter(camp => {
        if (!camp.dateEnd) return false;
        const dateEndTimestamp = new Date(camp.dateEnd).getTime();
        return todayTimestamp > dateEndTimestamp
    })

    return pastCamps
}